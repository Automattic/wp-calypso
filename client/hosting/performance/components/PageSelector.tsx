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
					__experimentalRenderItem={ ( { item } ) => (
						<div
							aria-label={ item.label }
							css={ {
								display: 'flex',
								flexDirection: 'column',
								paddingInline: '16px',
								paddingBlock: '8px',
								fontSize: '0.875rem',
								gap: '4px',
							} }
						>
							<span>{ item.label }</span>
							<span>{ item.path }</span>
						</div>
					) }
				/>
				<div
					css={ {
						position: 'absolute',
						right: '10px',
						top: '50%',
						transform: 'translateY(-50%)',
						display: 'flex',
						alignSelf: 'start',
						zIndex: 2,
						height: '100%',
						marginTop: '6px',
						pointerEvents: 'none',
					} }
				>
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
