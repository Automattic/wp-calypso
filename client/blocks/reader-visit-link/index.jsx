import { translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import ExternalLink from 'calypso/components/external-link';
import Tooltip from 'calypso/components/tooltip';
import ReaderExternalIcon from 'calypso/reader/components/icons/external-icon';

import './style.scss';

const noop = () => {};

const ReaderVisitLink = ( props ) => {
	const linkRef = useRef();
	const [ tooltip, setTooltip ] = useState( false );

	return (
		<ExternalLink
			className="reader-visit-link"
			href={ props.href }
			target="_blank"
			icon={ true }
			showIconFirst={ true }
			iconSize={ 24 }
			iconClassName="reader-visit-link__icon"
			iconComponent={ ReaderExternalIcon( { iconSize: 20 } ) }
			onClick={ props.onClick }
			ref={ linkRef }
			onMouseEnter={ () => setTooltip( true ) }
			onMouseLeave={ () => setTooltip( false ) }
		>
			<span className="reader-visit-link__label">{ props.children }</span>

			<Tooltip isVisible={ tooltip } position="bottom left" context={ linkRef.current }>
				{ translate( 'Views' ) }
			</Tooltip>
		</ExternalLink>
	);
};

ReaderVisitLink.propTypes = {
	href: PropTypes.string,
	iconSize: PropTypes.number,
	onClick: PropTypes.func,
};

ReaderVisitLink.defaultProps = {
	iconSize: 24,
	onClick: noop,
};

export default ReaderVisitLink;
