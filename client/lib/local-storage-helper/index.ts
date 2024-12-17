class LocalStorageHelper {
	private static instance: LocalStorageHelper;
	private cache: Map< string, any >;

	private constructor() {
		this.cache = new Map();
	}

	public static getInstance(): LocalStorageHelper {
		if ( ! LocalStorageHelper.instance ) {
			LocalStorageHelper.instance = new LocalStorageHelper();
		}
		return LocalStorageHelper.instance;
	}

	public getItem( key: string ): string | null {
		if ( this.cache.has( key ) ) {
			return this.cache.get( key );
		}

		const value = localStorage.getItem( key );
		if ( value ) {
			this.cache.set( key, value );
			return value;
		}

		return null;
	}

	public setItem( key: string, value: string ): void {
		this.cache.set( key, value );
		localStorage.setItem( key, value );
	}

	public removeItem( key: string ): void {
		this.cache.delete( key );
		localStorage.removeItem( key );
	}

	public clear(): void {
		this.cache.clear();
		localStorage.clear();
	}
}

export default LocalStorageHelper.getInstance();
