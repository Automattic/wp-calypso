import { useLocale } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import Stream from 'calypso/reader/stream';

const DiscoverStream = ( props ) => {
	const locale = useLocale();
	const { data: recommendedTags } = useQuery( {
		queryKey: [ 'read/interests', locale ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: `/read/interests`,
					apiNamespace: 'wpcom/v2',
				},
				{
					_locale: locale,
				}
			),
		select: ( data ) => {
			return data.interests;
		},
	} );
	console.log( 'recommendedTags', recommendedTags ); // We should filter out followed tags...

	// This is where we will render a horizontal scrollbar with tabs. The tab selected will
	// determine what we render below. We will return the default Stream for the recommended tab,
	// and figure out how to change this to tag streams when other tabs are selected.
	return <Stream { ...props } />;
};
export default DiscoverStream;
