import { createHmac } from 'crypto'
import { hash, compare } from 'bcryptjs'

export const doHash = async (value: string, saltValue: number): Promise<string> => {
    // const result = hash(value, saltValue);
    // return result;
    return hash(value, saltValue)
};

export const doHashValidation = async (value: string, hashedValue: string): Promise<boolean> => {
    // const result = compare(value, hashedValue)
    // return result;
    return compare(value, hashedValue);
};

export const hmacProcess = (value: string, key: string): string => {
    // const result = createHmac('sha256', key).update(value).digest('hex');
    // return result;
    return createHmac('sha256', key).update(value).digest('hex')
};