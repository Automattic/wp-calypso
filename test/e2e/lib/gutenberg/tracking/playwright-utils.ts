import type { Frame } from 'playwright';

export type TracksEvent = [
	string, // event name
	{
		_en: string; // event name
		blog_id: number;
		site_type: string; // e.g. 'simple'
		user_locale: string;
		post_type?: string;
		editor_type?: string;

		// Events can have their own custom properties
		[ key: string ]: any;
	}
];

export async function getLatestEvent( frame: Frame ): Promise< TracksEvent | undefined > {
	const stack = await getEventsStack( frame );
	return stack.length ? stack[ 0 ] : undefined;
}

export async function getEventsStack( frame: Frame ): Promise< TracksEvent[] > {
	return await frame.evaluate( () => {
		return ( window as any )._e2eEventsStack;
	} );
}
