const rewire = require("rewire")
const index = rewire("./index")
const changeRightContent = index.__get__("changeRightContent")
// @ponicode
describe("changeRightContent", () => {
    test("0", () => {
        let result = changeRightContent(false)
        expect(result).toMatchSnapshot()
    })

    test("1", () => {
        let result = changeRightContent(true)
        expect(result).toMatchSnapshot()
    })

    test("2", () => {
        let result = changeRightContent(undefined)
        expect(result).toMatchSnapshot()
    })
})
