import { times } from '@automattic/js-utils';
import Theme from 'calypso/components/theme';
import ThemeCollectionItem from 'calypso/components/theme-collection/theme-collection-item';

type ThemeCollectionPlaceholderProps = {
	items: number;
};

const ThemeCollectionPlaceholder = ( { items }: ThemeCollectionPlaceholderProps ) =>
	times( items, ( index ) => (
		<ThemeCollectionItem key={ `placeholder-${ index }` }>
			<Theme
				key={ `placeholder-${ index }` }
				theme={ { id: `placeholder-${ index }`, name: 'Loading…' } }
				isPlaceholder
			/>
		</ThemeCollectionItem>
	) );

export default ThemeCollectionPlaceholder;
