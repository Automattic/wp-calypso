import { action } from '@storybook/addon-actions';
import Search from './search';

export default { title: 'Search', component: Search };

const BoxedSearch = ( props ) => (
	<div style={ { position: 'relative', width: '270px', height: '50px' } }>
		<Search
			placeholder="Search..."
			fitsContainer
			// eslint-disable-next-line no-console
			onSearch={ ( search ) => console.log( 'Searched:', search ) }
			{ ...props }
		/>
	</div>
);

export const _default = () => {
	return <BoxedSearch />;
};

export const WhenTypingSearchMode = () => {
	return <BoxedSearch searchMode="when-typing" onSearch={ action( 'onSearch' ) } />;
};

export const OnEnterSearchMode = () => {
	return <BoxedSearch searchMode="on-enter" onSearch={ action( 'onSearch' ) } />;
};

export const Simple = () => {
	return <BoxedSearch hideClose hideOpenIcon compact />;
};

export const Delayed = () => {
	return <BoxedSearch delaySearch />;
};

export const Searching = () => {
	// eslint-disable-next-line jsx-a11y/no-autofocus
	return <BoxedSearch searching defaultValue="Kiwi" autoFocus />;
};

export const Disabled = () => <BoxedSearch disabled isOpen />;

export const Pinned = () => <BoxedSearch pinned />;

export const Compact = () => <BoxedSearch compact />;

export const CompactPinned = () => <BoxedSearch pinned compact fitsContainer />;

export const WithOverlayStyling = () => {
	const overlayStyling = ( input ) => {
		const tokens = input.split( /(\s+)/ );

		return tokens
			.filter( ( token ) => token.trim() )
			.map( ( token, i ) => (
				<span style={ { borderBottom: '1px solid blue', fontSize: '0.9rem' } } key={ i }>
					{ token }
				</span>
			) );
	};

	return <BoxedSearch overlayStyling={ overlayStyling } />;
};

export const WithDefaultValue = () => <BoxedSearch defaultValue="a default search value" />;
