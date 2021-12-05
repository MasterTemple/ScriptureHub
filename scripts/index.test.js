const rewire = require("rewire")
const index = rewire("./index")
const changeRightContent = index.__get__("changeRightContent")
const getFormattedVerse = index.__get__("getFormattedVerse")
const getSingleVerse = index.__get__("getSingleVerse")
const getInter = index.__get__("getInter")
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

// @ponicode
describe("getFormattedVerse", () => {
    test("0", () => {
        getFormattedVerse("John 1:1 nasb")
    })
})

// @ponicode
describe("getSingleVerse", () => {
    test("0", async () => {
        await getSingleVerse("John 1:1 nasb")
    })
})

// @ponicode
describe("getInter", () => {
    test("0", async () => {
        await getInter("John 1:1 nasb")
    })
})
