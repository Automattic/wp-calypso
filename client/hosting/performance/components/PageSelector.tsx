import { SearchableDropdown } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { ComponentProps } from 'react';

export const PageSelector = ( props: ComponentProps< typeof SearchableDropdown > ) => {
	return (
		<div
			css={ {
				display: 'flex',
				alignItems: 'center',
				flexGrow: 1,
				justifyContent: 'flex-end',
				gap: '10px',
			} }
		>
			<div>{ translate( 'Page' ) }</div>
			<SearchableDropdown
				{ ...props }
				css={ {
					maxWidth: '240px',
					minWidth: '240px',
					'.components-form-token-field__suggestions-list': { maxHeight: 'initial !important' },
					'.components-form-token-field__suggestions-list li': { padding: '0 !important' },
				} }
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
						<span>{ item.url }</span>
					</div>
				) }
			/>
		</div>
	);
};
