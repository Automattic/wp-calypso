import './search.stories.scss';
import { action } from '@storybook/addon-actions';
import { Icon } from '@wordpress/components';
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

export const WithDefaultValue = () => (
	<BoxedSearch defaultValue="a default search value overflowing the input box" />
);

export const WithCustomSearchIcon = () => {
	const customIcon = (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style={ { paddingLeft: '16px', paddingRight: '10px' } }
		>
			<path
				d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z"
				stroke="#8C8F94"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M17.5 17.5L13.875 13.875"
				stroke="#8C8F94"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);

	return <BoxedSearch searchIcon={ <Icon icon={ customIcon } /> } />;
};

export const WithDifferentColor = () => (
	// eslint-disable-next-line wpcalypso/jsx-classname-namespace
	<BoxedSearch className="stories__search--with-different-color" />
);

export const RTLMode = () => <BoxedSearch dir="rtl" />;
