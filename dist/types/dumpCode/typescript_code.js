"use strict";
// This file contains a wide variety of TypeScript code snippets to represent diverse use cases.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigDataSet = exports.multiplyNumbers = exports.addNumbers = exports.fetchWithAxios = exports.readFileContent = exports.createObservable = exports.MyEmitter = exports.partialUser = exports.successResponse = exports.isCircle = exports.readonlyUser = exports.Calculator = exports.MathUtils = exports.fetchData = exports.calculateArea = exports.Color = exports.Person = exports.PI = exports.greet = void 0;
exports.identity = identity;
exports.longRunningTask = longRunningTask;
// Import and Export examples
const greet = (name) => `Hello, ${name}!`;
exports.greet = greet;
exports.PI = 3.14159;
// Generic Functions
function identity(arg) {
    return arg;
}
// Classes
class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    greet() {
        return `Hi, I'm ${this.name} and I'm ${this.age} years old.`;
    }
}
exports.Person = Person;
// Enums
var Color;
(function (Color) {
    Color["Red"] = "RED";
    Color["Green"] = "GREEN";
    Color["Blue"] = "BLUE";
})(Color || (exports.Color = Color = {}));
// Utility Functions
const calculateArea = (shape) => {
    switch (shape.kind) {
        case "circle":
            return exports.PI * Math.pow(shape.radius, 2);
        case "rectangle":
            return shape.width * shape.height;
    }
};
exports.calculateArea = calculateArea;
// Promises and Async/Await
const fetchData = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(url);
    return response.json();
});
exports.fetchData = fetchData;
// Modules and Namespaces
var MathUtils;
(function (MathUtils) {
    MathUtils.add = (a, b) => a + b;
    MathUtils.subtract = (a, b) => a - b;
})(MathUtils || (exports.MathUtils = MathUtils = {}));
// Decorators
function Log(target, propertyName, descriptor) {
    const original = descriptor.value;
    descriptor.value = function (...args) {
        console.log(`Called ${propertyName} with arguments:`, args);
        return original.apply(this, args);
    };
}
let Calculator = (() => {
    var _a;
    let _instanceExtraInitializers = [];
    let _add_decorators;
    let _multiply_decorators;
    return _a = class Calculator {
            add(a, b) {
                return a + b;
            }
            multiply(a, b) {
                return a * b;
            }
            constructor() {
                __runInitializers(this, _instanceExtraInitializers);
            }
        },
        (() => {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _add_decorators = [Log];
            _multiply_decorators = [Log];
            __esDecorate(_a, null, _add_decorators, { kind: "method", name: "add", static: false, private: false, access: { has: obj => "add" in obj, get: obj => obj.add }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(_a, null, _multiply_decorators, { kind: "method", name: "multiply", static: false, private: false, access: { has: obj => "multiply" in obj, get: obj => obj.multiply }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
})();
exports.Calculator = Calculator;
exports.readonlyUser = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
};
// Type Guards
const isCircle = (shape) => shape.kind === "circle";
exports.isCircle = isCircle;
exports.successResponse = {
    status: "success",
    data: { id: 1, name: "Alice", email: "alice@example.com" },
};
// Example Usage of DeepPartial
exports.partialUser = {
    name: "Bob",
};
// Event Emitters
const events_1 = require("events");
class MyEmitter extends events_1.EventEmitter {
    emitEvent(event, payload) {
        this.emit(event, payload);
    }
}
exports.MyEmitter = MyEmitter;
// Reactive Programming with Observables
const rxjs_1 = require("rxjs");
const createObservable = () => {
    return new rxjs_1.Observable((subscriber) => {
        let count = 0;
        const interval = setInterval(() => {
            subscriber.next(count++);
            if (count > 5) {
                subscriber.complete();
            }
        }, 1000);
        return () => clearInterval(interval);
    });
};
exports.createObservable = createObservable;
// File Handling
const fs = __importStar(require("fs"));
const readFileContent = (filePath) => {
    return fs.readFileSync(filePath, "utf-8");
};
exports.readFileContent = readFileContent;
// HTTP Requests
const axios_1 = __importDefault(require("axios"));
const fetchWithAxios = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(url);
    return response.data;
});
exports.fetchWithAxios = fetchWithAxios;
// Testing Example
const addNumbers = (a, b) => a + b;
exports.addNumbers = addNumbers;
const multiplyNumbers = (a, b) => a * b;
exports.multiplyNumbers = multiplyNumbers;
// Additional Code to Expand File Size
exports.bigDataSet = Array.from({ length: 1000 }, (_, i) => ({ id: i, value: `Item ${i}` }));
function longRunningTask(input) {
    const result = [];
    for (let i = 0; i < input; i++) {
        result.push(i * i);
    }
    return result;
}
