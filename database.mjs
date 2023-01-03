import { users } from "./users-data.mjs";

export class FakeSQLDatabase {
    database = {};

    constructor() {
        this.database["users"] = users;
    }

    insert({table_name, values}) {;
        if (this.database[table_name])
        {
            const id = this.database.length > 0 ? this.database[this.database.length - 1].id : 0;
            this.database[table_name].push({...values, id})
        }
    } 

    select({columns, result}) {
        if (columns === "*") {
            return result;
        }

        if (!result) {
            return []
        }

        return result.map(row => {
            const newRow = {};

            for (const column of columns) {
                if (column in row) {
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

                if (!(column in row)) return false

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

    orderBy({result, order = 'ASC', column}) {
        if (result.length === 0 || !(column in result[0]) || !(["DESC", "ASC"].includes(order))) {
            return result;
        }

        const return_signal = order === 'ASC' ? 1 : -1;

        return result.sort(
            function (row1, row2) {
                if (row1[column] < row2[column])
                    return -1 * return_signal;
                else if (row1[column] > row2[column])
                    return 1 * return_signal;
                else
                    return 0;
            }
        )
    }

    delete ({ table_name, where }) {
        let counter = 0

        this.from({table_name, where}).forEach(row =>
            this.database[table_name].pop(row)
        )

        return counter;
    }
}

const d = new FakeSQLDatabase();

console.table(
    d.select({
        columns: ["id", "name", "job"],
        result: d.orderBy({
            column: "age",
            order: "DESC",
            result: d.from({
                table_name: "users",
                where: [
                    {
                        column: "age",
                        operator: "GT",
                        value: 20
                    }
                ]
            })
        })
    })
)

d.insert({
    table_name: "users",
    values: {
        "name": "Sonic",
        "species": "Hedgehog",
        "age": 32,
        "city": "None",
        "job": "Egg eater"
    }
})

console.table(
    d.select({
        columns: "*",
        result: d.from({
            table_name: "users",
            where: [
                {
                    column: "name",
                    operator: "EQ",
                    value: "Sonic"
                }
            ]
        })
    })
)

d.delete({
    table_name: "users",
    where: [
        {
            column: "age",
            operator: "GT",
            value: 5                
        }
    ]
})

console.table(
    d.select({
        columns: "*",
        result: d.from({
            table_name: "users"
        })
    })
)