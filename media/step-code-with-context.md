## Example Output

Select a function and grab it:

    src/utils/auth.ts:10-15
    ```ts
    export function validateToken(token: string): boolean {
      const decoded = decode(token);
      return decoded.exp > Date.now() / 1000;
    }
    ```

The file path, line range, and language-tagged fence are all included automatically.
