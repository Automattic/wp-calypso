/**
 * Generics
 *
 * S: State - the application state
 * D: Dependents - Array of dependent values returned by the DependentsSelector
 * R: Result of Selector
 * O: Other parameters that the computation and resulting CachedSelector are provided
 */
/**
 * DependentsSelector is a function that accepts a State (S) object and
 * returns an array of values to be used in the Selector as well
 * as the values used by the caching/memoization layer.
 */
declare type DependentsSelector<S, O, D> = (S: any, ...O: any[]) => D & any[];
/**
 * Function that computes a value based on the dependent values provided
 * by the DependentsSelector. It receives the values returned by
 * DependentsSelector as its first argument, the rest of the arguments
 * given to the computation are the same as the CachedSelector retured
 * by treeSelect.
 */
declare type Selector<D, R, O> = (D: any, ...O: any[]) => R;
/**
 * The cached selector is the returned function from treeSelect. It should
 * have the same signatrue as Selector except it accepts the State as its
 * first argument instead of the result of DependentsSelector. The rest of
 * the other (O) arguments are the same provided to the Selector.
 */
declare type CachedSelector<S, R, O> = (S: any, ...O: any[]) => R;
interface Options<O> {
    /**
     * Custom function to compute the cache key from the selector's `args` list
     */
    getCacheKey?: (...O: any[]) => string;
}
/**
 * Returns a selector that caches values.
 *
 * @param  getDependents A Function describing the dependent(s) of the selector. Must return an array which gets passed as the first arg to the selector.
 * @param  selector      A standard selector for calculating cached result.
 * @param  options       Additional options
 * @return               Cached selector
 */
export default function treeSelect<S, D, R, O>(getDependents: DependentsSelector<S, O, D>, selector: Selector<D, R, O>, options?: Options<O>): CachedSelector<S, R, O>;
export {};
