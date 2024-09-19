import { SearchableDropdown } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ComponentProps } from 'react';

export const PageSelector = ( props: ComponentProps< typeof SearchableDropdown > ) => {
	const translate = useTranslate();

	return (
		<div
			css={ {
				display: 'flex',
				alignItems: 'flex-start',
				flexGrow: 1,
				justifyContent: 'flex-end',
				gap: '10px',
				maxHeight: '40px',
			} }
		>
			<div css={ { alignSelf: 'stretch', display: 'flex', alignItems: 'center' } }>
				{ translate( 'Page' ) }
			</div>
			<SearchableDropdown
				{ ...props }
				css={ {
					maxWidth: '240px',
					minWidth: '240px',
					'.components-combobox-control__suggestions-container': {
						position: 'relative',
						zIndex: 1,
						background: 'var(--color-surface)',
					},
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
						<span>{ item.path }</span>
					</div>
				) }
			/>
		</div>
	);
};
