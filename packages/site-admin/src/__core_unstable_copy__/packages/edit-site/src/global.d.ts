interface ViewTransition {
	finished: Promise< void >;
}

interface Document {
	/*
	 * @unstable: TS fix -> startViewTransition is used in useHistory,
	 * not present in core.
	 */
	startViewTransition: ( callback: () => void ) => ViewTransition;
}
