import { isEnabled } from '@automattic/calypso-config';
import { times } from 'lodash';
import Theme from 'calypso/components/theme';
import ThemeCollectionItem from 'calypso/components/theme-collection/theme-collection-item';
import ThemeNew from 'calypso/components/themenew';

type ThemeCollectionPlaceholderProps = {
	items: number;
};

const ThemeCollectionPlaceholder = ( { items }: ThemeCollectionPlaceholderProps ) =>
	times( items, ( index ) => (
		<ThemeCollectionItem key={ `placeholder-${ index }` }>
			{ isEnabled( 'themes/new-theme-card' ) ? (
				<ThemeNew isPlaceholder={ true } key={ `placeholder-${ index }` } themePosition={ index } />
			) : (
				<Theme
					key={ `placeholder-${ index }` }
					theme={ { id: `placeholder-${ index }`, name: 'Loading…' } }
					isPlaceholder={ true }
				/>
			) }
		</ThemeCollectionItem>
	) );

export default ThemeCollectionPlaceholder;
