import { renderToString } from 'react-dom/server';
import DocumentHead from '..';

test( 'records server metadata in Redux without rendering it into the layout', () => {
	const props = {
		title: 'Page title',
		formattedTitle: 'Page title',
		meta: [ { name: 'description', content: 'Page description' } ],
		link: [ { rel: 'canonical', href: 'https://example.com/page' } ],
		setTitle: jest.fn(),
		setUnreadCount: jest.fn(),
		setLink: jest.fn(),
		setMeta: jest.fn(),
	};
	const Writer = DocumentHead.WrappedComponent;

	expect( renderToString( <Writer { ...props } /> ) ).toBe( '' );
	expect( props.setTitle ).toHaveBeenCalledWith( props.title );
	expect( props.setMeta ).toHaveBeenCalledWith( props.meta );
	expect( props.setLink ).toHaveBeenCalledWith( props.link );
} );
