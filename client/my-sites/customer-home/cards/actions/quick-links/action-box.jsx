import { CompactCard, Gridicon } from '@automattic/components';
import classnames from 'classnames';
import MaterialIcon from 'calypso/components/material-icon';

const ActionBox = ( {
	href,
	onClick,
	target,
	iconSrc,
	label,
	materialIcon,
	gridicon,
	iconComponent,
	hideLinkIndicator,
} ) => {
	const buttonAction = { href, onClick, target };
	const getIcon = () => {
		if ( materialIcon ) {
			return <MaterialIcon className="quick-links__action-box-icon" icon={ materialIcon } />;
		}

		if ( gridicon ) {
			return <Gridicon className="quick-links__action-box-icon" icon={ gridicon } />;
		}

		if ( iconComponent ) {
			return iconComponent;
		}

		return <img className="quick-links__action-box-icon" src={ iconSrc } alt="" />;
	};

	return (
		<CompactCard
			{ ...buttonAction }
			className={ classnames( 'quick-links__action-box', {
				'quick-links__action-box__hide-link-indicator': hideLinkIndicator,
			} ) }
		>
			<div className="quick-links__action-box-image" aria-hidden="true">
				{ getIcon() }
			</div>
			<div className="quick-links__action-box-text">
				<span className="quick-links__action-box-label">{ label }</span>
			</div>
		</CompactCard>
	);
};

export default ActionBox;
