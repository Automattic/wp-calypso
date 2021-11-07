import { localize } from 'i18n-calypso';
import { useQuery } from 'react-query';
import EmptyContent from 'calypso/components/empty-content';
import wpcom from 'calypso/lib/wp';
import { ConnectedThemesSelection } from './themes-selection';

const FseThemes = localize( ( { translate, ...restProps } ) => {
	const { data, error, isLoading } = useQuery(
		'fse-themes',
		() =>
			wpcom.req.get( '/themes', {
				filter: 'block-templates',
				number: 50,
				tier: '',
				apiVersion: '1.2',
			} ),
		{}
	);
	if ( error ) {
		return <EmptyContent title={ translate( 'Sorry, no themes found.' ) } />;
	}
	return (
		<ConnectedThemesSelection
			isLoading={ isLoading }
			customizedThemesList={ data?.themes ?? [] }
			{ ...restProps }
		/>
	);
} );
export default FseThemes;
