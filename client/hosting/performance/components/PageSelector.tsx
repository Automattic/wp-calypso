import { SearchableDropdown } from '@automattic/components';
import { Icon } from '@wordpress/components';
import { search } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ComponentProps } from 'react';

export const PageSelector = ( props: ComponentProps< typeof SearchableDropdown > ) => {
	const translate = useTranslate();

	return (
		<div className="site-performance__page-selector">
			<div css={ { alignSelf: 'stretch', display: 'flex', alignItems: 'center' } }>
				{ translate( 'Page' ) }
			</div>
			<div className="site-performance__page-selector-container">
				<SearchableDropdown
					{ ...props }
					className="site-performance__page-selector-drowdown"
					__experimentalRenderItem={ ( { item } ) => {
						if ( item.value === '-1' ) {
							return (
								<div className="message">
									{ translate( 'Searching your top 20 most popular pages.' ) }
								</div>
							);
						}
						if ( item.value === '-2' ) {
							return <div className="message">{ translate( 'No pages found' ) }</div>;
						}
						return (
							<div className="site-performance__page-selector-item" aria-label={ item.label }>
								<span>{ item.label }</span>
								<span className="subtitle">{ item.path }</span>
							</div>
						);
					} }
				/>
				<div className="site-performance__page-selector-search-icon">
					<Icon
						icon={ search }
						size={ 24 }
						style={ { fill: props.disabled ? 'var(--studio-gray-20)' : 'var(--color-neutral-50)' } }
					/>
				</div>
			</div>
		</div>
	);
};
