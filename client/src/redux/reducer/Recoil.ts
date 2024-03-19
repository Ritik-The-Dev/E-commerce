import {atom} from 'recoil'

export const cart = atom({
    key:"cart",
    default:[]
})
export const subtotals = atom({
    key:"subtotal",
    default:0
})
export const discounts = atom({
    key:"discount",
    default:0
})