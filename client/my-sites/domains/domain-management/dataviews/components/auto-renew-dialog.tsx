import { SelectDropdown } from '@automattic/components';
import { PartialDomainData } from '@automattic/data-stores';
import transformIcon from '@automattic/domains-table/src/bulk-actions-toolbar/transform.svg';
import { RenderModalProps } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDomainsDataViewsContext } from '../use-context';

export const AutoRenewDiolog = ( {
	items,
	closeModal,
	onActionPerformed,
}: RenderModalProps< PartialDomainData > ) => {
	const { handleAutoRenew } = useDomainsDataViewsContext();
	const translate = useTranslate();
	const [ controlKey, setControlKey ] = useState( 1 );

	const enableLabel = translate( 'Turn {{strong}}on{{/strong}} auto-renew', {
		components: { strong: <strong /> },
	} );

	const disableLabel = translate( 'Turn {{strong}}off{{/strong}} auto-renew', {
		components: { strong: <strong /> },
	} );

	const handleAutoRenewSelect = ( { value }: { value: string } ) => {
		if ( value === 'enable' ) {
			handleAutoRenew( items, true );
		} else if ( value === 'disable' ) {
			handleAutoRenew( items, false );
		}

		// By default the SelectDropdown will "select" the item that was clicked. We don't
		// want this so we force the components internal state to be reset, which keeps
		// the selection set to `initialSelected="button-label"`.
		setControlKey( ( oldKey ) => oldKey + 1 );

		onActionPerformed?.( items );
		closeModal?.();
	};

	return (
		<div>
			<p>
				{ translate(
					/* translators: domainCount will be the number of domains to update */
					'Update auto-renew settings for %(domainCount)d domain',
					'Update auto-renew settings for %(domainCount)d domains',
					{
						count: items.length,
						args: {
							domainCount: items.length,
						},
					}
				) }
			</p>
			<SelectDropdown
				key={ controlKey }
				className="domains-table-bulk-actions-toolbar__select"
				initialSelected="button-label"
				showSelectedOption={ false }
				onSelect={ handleAutoRenewSelect }
				options={ [
					{
						value: 'button-label',
						label: translate( 'Choose new status…' ),
						icon: (
							<img
								className="domains-table-bulk-actions-toolbar__icon"
								src={ transformIcon }
								width={ 18 }
								height={ 18 }
								alt=""
							/>
						),
					},
					{ value: 'enable', label: enableLabel },
					{ value: 'disable', label: disableLabel },
				] }
			/>
		</div>
	);
};
