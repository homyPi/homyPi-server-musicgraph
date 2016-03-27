import {nock} from "nock";


export const STATUS = {
    SUCCESS: {
        code: 200,
        response: "Success"
    },
    TOO_MANY_REQUEST: {
        
    }
}

function mockApi(status=STATUS.SUCCESS) {

}

export default mockApi;
