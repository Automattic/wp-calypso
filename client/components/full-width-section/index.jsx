import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useIsMarketplaceRedesignEnabled } from 'calypso/my-sites/plugins/hooks/use-is-marketplace-redesign-enabled';

import './style.scss';

const FullWidthSection = ( { children, className } ) => {
	const isMarketplaceRedesignEnabled = useIsMarketplaceRedesignEnabled();

	// TODO: Remove this when the marketplace redesign is enabled by default
	if ( ! isMarketplaceRedesignEnabled ) {
		return children;
	}

	return (
		<div className={ clsx( 'full-width-section', className ) }>
			<div className="full-width-section__content">{ children }</div>
		</div>
	);
};

FullWidthSection.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
};

export default FullWidthSection;
