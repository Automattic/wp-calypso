import { SearchableDropdown } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ComponentProps } from 'react';

export const PageSelector = ( props: ComponentProps< typeof SearchableDropdown > ) => {
	const translate = useTranslate();

	return (
		<div className="site-performance__page-selector">
			<div css={ { alignSelf: 'stretch', display: 'flex', alignItems: 'center' } }>
				{ translate( 'Page' ) }
			</div>
			<SearchableDropdown
				{ ...props }
				className="site-performance__page-selector-drowdown"
				__experimentalRenderItem={ ( { item } ) => (
					<div
						aria-label={ item.label }
						css={ {
							display: 'flex',
							flexDirection: 'column',
							paddingInline: '16px',
							paddingBlock: '8px',
						} }
					>
						<span>{ item.label }</span>
						<span>{ item.path }</span>
					</div>
				) }
			/>
		</div>
	);
};
