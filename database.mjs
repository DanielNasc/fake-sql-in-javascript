import { users } from "./users-data.mjs";

export class FakeSQLDatabase {
    database = {};

    constructor() {
        this.database["users"] = users;
    }

    select({columns, table}) {
        if (columns === "*") {
            return table;
        }

        const data = table;
        if (!data) {
            return [];
        }

        return data.map(row => {
            const newRow = {};

            for (const column of columns) {
                if (row[column]) {
                    newRow[column] = row[column];
                }
            }

            return newRow;
        })
    }

    from({ table_name, where }) {
        if (!where) {
            return this.database[table_name];
        }

        const data = this.database[table_name];

        if (!data) {
            return [];
        }

        // where expression -> COLUMN, "EQ|LT|GT", VALUE
        return data.filter(row => {
            for (const expr of where) {
                const { column, operator, value } = expr;

                if (!row[column]) return false

                switch(operator) {
                    case "EQ":
                        if (row[column] !== value) 
                            return false;
                        break;
                    case "LT":
                        if (row[column] >= value) 
                            return false;
                    case "GT":
                        if (row[column] <= value)
                            return false
                }
            }

            return true;
        })
    }
}

const d = new FakeSQLDatabase();
console.table(
    d.select({
        columns: ["name", "age", "job"],
        table: d.from({
            table_name: "users",
            where: [
                {
                    column: "age",
                    operator: "GT",
                    value: 3
                }
            ]
        })
    })
)