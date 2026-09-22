/** Fixed, named editor slots become arrays for the existing presentation components.
 * Sorting the slot keys keeps layout order in code, even if JSON keys are reordered.
 */
type ContentValue<T> = T extends object
  ? keyof T extends `item${number}`
    ? ContentValue<T[keyof T]>[]
    : { [K in keyof T]: ContentValue<T[K]> }
  : T;

export function fromContentSlots<T>(value: T): ContentValue<T> {
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length && entries.every(([key]) => /^item\d+$/.test(key))) {
      return entries.sort(([a], [b]) => a.localeCompare(b))
        .map(([, item]) => fromContentSlots(item)) as ContentValue<T>;
    }
    return Object.fromEntries(entries.map(([key, item]) => [key, fromContentSlots(item)])) as ContentValue<T>;
  }
  return value as ContentValue<T>;
}
