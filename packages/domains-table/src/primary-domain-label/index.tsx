import { Badge, Gridicon, Popover } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useRef, useState, ComponentRef } from 'react';
import './style.scss';

export const PrimaryDomainLabel = () => {
	const [ showPrimaryDomainInfo, setShowPrimaryDomainInfo ] = useState( false );
	const { __ } = useI18n();
	const popoverRef = useRef< ComponentRef< typeof Badge > >( null );

	return (
		<Badge
			ref={ popoverRef }
			className="domains-table__primary-domain-label"
			type="info-green"
			onMouseEnter={ () => setShowPrimaryDomainInfo( true ) }
			onMouseLeave={ () => setShowPrimaryDomainInfo( false ) }
		>
			{ __( 'Primary site address', __i18n_text_domain__ ) }
			<Gridicon size={ 16 } icon="info-outline" />
			<Popover
				className="domains-table__primary-domain-label-popover"
				position="top right"
				context={ popoverRef.current }
				isVisible={ showPrimaryDomainInfo }
			>
				<div className="domains-table__primary-domain-label-popover-content">
					{ __( 'Your other domains will redirect to this domain.', __i18n_text_domain__ ) }
				</div>
			</Popover>
		</Badge>
	);
};
