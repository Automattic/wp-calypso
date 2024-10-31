import { SearchableDropdown } from '@automattic/components';
import { Icon } from '@wordpress/components';
import { search } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ComponentProps } from 'react';

interface PageSelectorProps extends ComponentProps< typeof SearchableDropdown > {
	onBlur?: ( event: React.FocusEvent< HTMLDivElement > ) => void;
}

export const PageSelector = ( { onBlur, ...props }: PageSelectorProps ) => {
	const translate = useTranslate();

	return (
		<div className="site-performance__page-selector">
			<div css={ { alignSelf: 'stretch', display: 'flex', alignItems: 'center' } }>
				{ translate( 'Page' ) }
			</div>
			<div className="site-performance__page-selector-container">
				<div onBlur={ onBlur } tabIndex={ -1 }>
					<SearchableDropdown
						{ ...props }
						className="site-performance__page-selector-drowdown"
						__experimentalRenderItem={ ( { item } ) => {
							if ( item.value === '-1' ) {
								return (
									<div className="message">
										{ translate(
											'Performance testing is available for the 20 most popular pages.'
										) }
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
				</div>
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
