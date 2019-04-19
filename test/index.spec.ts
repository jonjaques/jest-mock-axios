import SyncPromise from 'jest-mock-promise';
import MockAxios from '../lib/index';

describe("MockAxios", () => {

    afterEach(() => {
        MockAxios.reset();
    });

    it(`should return a promise when called directly`, () => {
        expect(typeof MockAxios).toBe("function");
        expect(MockAxios()).toEqual(new SyncPromise);
    });
    it("`get` should return a promise", () => {
        expect(MockAxios.get()).toEqual(new SyncPromise());
    });
    it("`put` should return a promise", () => {
        expect(MockAxios.put()).toEqual(new SyncPromise());
    });
    it("`patch` should return a promise", () => {
        expect(MockAxios.patch()).toEqual(new SyncPromise());
    });
    it("`post` should return a promise", () => {
        expect(MockAxios.post()).toEqual(new SyncPromise());
    });
    it("`delete` should return a promise", () => {
        expect(MockAxios.delete()).toEqual(new SyncPromise());
    });
    it("`head` should return a promise", () => {
        expect(MockAxios.head()).toEqual(new SyncPromise());
    });
    it("`options` should return a promise", () => {
        expect(MockAxios.options()).toEqual(new SyncPromise());
    });
    it("`request` should return a promise", () => {
        expect(MockAxios.request()).toEqual(new SyncPromise());
    });
    it("`all` should return a promise", () => {
        const promise = Promise.resolve("");
        expect(MockAxios.all([promise])).toBeInstanceOf(Promise);
    });
    it("`create` should return reference to MockAxios itself", () => {
        expect(MockAxios.create()).toBe(MockAxios);
    });

    // mockResponse - Simulate a server response, (optionaly) with the given data
    it("`mockResponse` should resolve the given promise with the provided response", () => {
        const thenFn = jest.fn();
        MockAxios.post().then(thenFn);

        const responseData = { data: {text: "some data" } };
        const responseObj = {config: {}, data: responseData.data, headers: {}, status: 200, statusText: "OK"};
        MockAxios.mockResponse(responseObj);

        expect(thenFn).toHaveBeenCalledWith(responseObj);
    });

    it("`mockResponse` should remove the last promise from the queue", () => {
        MockAxios.post();
        MockAxios.mockResponse();
        expect(MockAxios.popPromise()).toBeUndefined();
    });

    it("`mockResponse` resolve the provided promise", () => {
        const firstFn = jest.fn();
        const secondFn = jest.fn();
        const thirdFn = jest.fn();

        const firstPromise = MockAxios.post().then(firstFn);
        const secondPromise = MockAxios.post().then(secondFn);
        const thirdPromise = MockAxios.post().then(thirdFn);

        const responseData = { data: {text: "some data" } };
        const responseObj = {config: {}, data: responseData.data, headers: {}, status: 200, statusText: "OK"};
        MockAxios.mockResponse(responseObj, secondPromise);

        expect(firstFn).not.toHaveBeenCalled();
        expect(secondFn).toHaveBeenCalledWith(responseObj);
        expect(thirdFn).not.toHaveBeenCalled();
    });

    it("`mockResponse` should resolve the last given promise if none was provided", () => {
        const firstPromise = MockAxios.post();
        const secondPromise = MockAxios.post();
        const thirdPromise = MockAxios.post();

        const firstThen = jest.fn();
        const secondThen = jest.fn();
        const thirdThen = jest.fn();

        firstPromise.then(firstThen);
        secondPromise.then(secondThen);
        thirdPromise.then(thirdThen);

        MockAxios.mockResponse();

        expect(firstThen).toHaveBeenCalled();
        expect(secondThen).not.toHaveBeenCalled();
        expect(thirdThen).not.toHaveBeenCalled();

        MockAxios.mockResponse();

        expect(secondThen).toHaveBeenCalled();
        expect(thirdThen).not.toHaveBeenCalled();

        MockAxios.mockResponse();

        expect(thirdThen).toHaveBeenCalled();

        // functions should be called once only
        expect(firstThen.mock.calls.length).toBe(1);
        expect(secondThen.mock.calls.length).toBe(1);
        expect(thirdThen.mock.calls.length).toBe(1);
    });

    it("`mockResponse` should throw a specific error if no request can be resolved", () => {
        expect(() => MockAxios.mockResponse()).toThrowError("No request to respond to!");
    });

    it("`mockResponse` should not throw a specific error if no request can be resolved but silentMode is true", () => {
        expect(() => MockAxios.mockResponse(undefined, undefined, true)).not.toThrow();
    });

    // mockError - Simulate an error in server request
    it("`mockError` should fail the given promise with the provided response", () => {
        const thenFn = jest.fn();
        const catchFn = jest.fn();
        const promise = MockAxios.post().then(thenFn).catch(catchFn);

        const errorObj = { n: "this is an error" };

        MockAxios.mockError(errorObj, promise);
        expect(catchFn).toHaveBeenCalledWith(errorObj);
        expect(thenFn).not.toHaveBeenCalledWith(errorObj);
    });

    it("`mockError` should remove the promise from the queue", () => {
        MockAxios.post();
        MockAxios.mockError();
        expect(MockAxios.popPromise()).toBeUndefined();
    });

    it("`mockError` fail the provided promise", () => {
        const firstFn = jest.fn();
        const secondFn = jest.fn();
        const thirdFn = jest.fn();

        const firstPromise = MockAxios.post().catch(firstFn);
        const secondPromise = MockAxios.post().catch(secondFn);
        const thirdPromise = MockAxios.post().catch(thirdFn);

        MockAxios.mockError({}, secondPromise);

        expect(firstFn).not.toHaveBeenCalled();
        expect(secondFn).toHaveBeenCalled();
        expect(thirdFn).not.toHaveBeenCalled();
    });

    it("`mockError` should fail the last given promise if none was provided", () => {
        const firstPromise = MockAxios.post();
        const secondPromise = MockAxios.post();
        const thirdPromise = MockAxios.post();

        const firstFn = jest.fn();
        const secondFn = jest.fn();
        const thirdFn = jest.fn();

        firstPromise.catch(firstFn);
        secondPromise.catch(secondFn);
        thirdPromise.catch(thirdFn);

        MockAxios.mockError({});

        expect(firstFn).toHaveBeenCalled();
        expect(secondFn).not.toHaveBeenCalled();
        expect(thirdFn).not.toHaveBeenCalled();

        MockAxios.mockError();

        expect(secondFn).toHaveBeenCalled();
        expect(thirdFn).not.toHaveBeenCalled();

        MockAxios.mockError();

        expect(thirdFn).toHaveBeenCalled();

        // functions should be called once only
        expect(firstFn.mock.calls.length).toBe(1);
        expect(secondFn.mock.calls.length).toBe(1);
        expect(thirdFn.mock.calls.length).toBe(1);
    });

    it("`mockError` should throw a specific error if no request can be resolved", () => {
        expect(() => MockAxios.mockError()).toThrowError("No request to respond to!");
    });

    it("`mockError` should not throw a specific error if no request can be resolved but silentMode is true", () => {
        expect(() => MockAxios.mockError(undefined, undefined, true)).not.toThrow();
    });

    // lastReqGet - returns the most recent request
    it("`lastReqGet` should return the most recent request", () => {
        const thenFn = jest.fn();
        const firstPromise = MockAxios.post();
        const lastPromise = MockAxios.post();

        expect(MockAxios.lastReqGet().promise).toBe(lastPromise);
    });

    // lastPromiseGet - Returns promise of the most recent request
    it("`lastPromiseGet` should return the most recent promise", () => {
        const thenFn = jest.fn();
        const firstPromise = MockAxios.post();
        const lastPromise = MockAxios.post();

        expect(MockAxios.lastPromiseGet()).toBe(lastPromise);
    });

    // popPromise - Removes the give promise from the queue
    it("`popPromise` should remove the given promise from the queue", () => {
        const thenFn = jest.fn();

        const firstPromise = MockAxios.post();
        const secondPromise = MockAxios.post();
        const thirdPromise = MockAxios.post();

        expect(MockAxios.popPromise(firstPromise)).toBe(firstPromise);
        expect(MockAxios.popPromise(thirdPromise)).toBe(thirdPromise);
        expect(MockAxios.popPromise(secondPromise)).toBe(secondPromise);

        // queue should be empty
        expect(MockAxios.lastPromiseGet()).toBeUndefined();
    });

    // popPromise - Removes the give promise from the queue
    it("`popRequest` should remove the given request from the queue", () => {
        const thenFn = jest.fn();

        MockAxios.post();
        const firstReq = MockAxios.lastReqGet();
        MockAxios.post();
        const secondReq = MockAxios.lastReqGet();
        MockAxios.post();
        const thirdReq = MockAxios.lastReqGet();

        expect(MockAxios.popRequest(firstReq)).toBe(firstReq);
        expect(MockAxios.popRequest(thirdReq)).toBe(thirdReq);
        expect(MockAxios.popRequest(secondReq)).toBe(secondReq);

        // queue should be empty
        expect(MockAxios.lastReqGet()).toBeUndefined();
    });

    // reset - Clears all of the queued requests
    it("`reset` should clear all the queued requests", () => {
        const thenFn = jest.fn();

        const firstPromise = MockAxios.post();
        const lastPromise = MockAxios.post();

        MockAxios.reset();
        MockAxios.reset();

        expect(MockAxios.lastReqGet()).toBeUndefined();
    });

    it("`reset` should clear clear all the spy statistics", () => {
        MockAxios.post();
        MockAxios.get();
        MockAxios.put();
        MockAxios.patch();
        MockAxios.delete();
        MockAxios.request();
        MockAxios.all([]);
        MockAxios.head();
        MockAxios.options();

        expect(MockAxios.post).toHaveBeenCalled();
        expect(MockAxios.get).toHaveBeenCalled();
        expect(MockAxios.put).toHaveBeenCalled();
        expect(MockAxios.patch).toHaveBeenCalled();
        expect(MockAxios.delete).toHaveBeenCalled();
        expect(MockAxios.request).toHaveBeenCalled();
        expect(MockAxios.all).toHaveBeenCalled();
        expect(MockAxios.head).toHaveBeenCalled();
        expect(MockAxios.options).toHaveBeenCalled();

        MockAxios.reset();

        expect(MockAxios.post).not.toHaveBeenCalled();
        expect(MockAxios.get).not.toHaveBeenCalled();
        expect(MockAxios.put).not.toHaveBeenCalled();
        expect(MockAxios.patch).not.toHaveBeenCalled();
        expect(MockAxios.delete).not.toHaveBeenCalled();
        expect(MockAxios.request).toHaveBeenCalled();
        expect(MockAxios.all).not.toHaveBeenCalled();
        expect(MockAxios.head).not.toHaveBeenCalled();
        expect(MockAxios.options).not.toHaveBeenCalled();
    });
});
