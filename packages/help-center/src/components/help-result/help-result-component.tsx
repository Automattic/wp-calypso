/* eslint-disable wpcalypso/jsx-classname-namespace */

import { CompactCard, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import type { HelpResult } from '../types';
// import { decodeEntities } from 'calypso/lib/formatting';

// import './style.scss';

interface Props {
	helpLink: HelpResult;
	iconTypeDescription?: string;
	onClick?: () => void;
	compact: boolean;
}

const HelpResultComponent: React.FC< Props > = ( {
	helpLink,
	onClick,
	compact,
	iconTypeDescription = 'book',
} ) => {
	console.log( 'HelpResultComponent', helpLink.title );

	const handleClick = ( event ) => {
		if ( helpLink.disabled ) {
			return event.preventDefault();
		}

		onClick?.( event, helpLink );
	};

	function getResultImage() {
		if ( ! helpLink.image ) {
			return;
		}

		return <img src={ helpLink.image } alt="" />;
	}

	function getResultIcon() {
		//If we've assigned an image, don't show the icon
		if ( helpLink.image ) {
			return;
		}

		const iconClass = 'help-result__icon';
		const iconSize = 24;
		// By rule, gridicons don't contain logos so we need a special case here
		if ( iconTypeDescription === 'jetpack' ) {
			return (
				<svg
					className={ iconClass }
					height={ iconSize }
					width={ iconSize }
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
				>
					<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-.39 12.335l-3.14-.8c-.798-.202-1.18-1.11-.77-1.822l3.91-6.773v9.395zm4.84-2.048l-3.91 6.773V9.665l3.14.8c.798.202 1.18 1.11.77 1.822z" />
				</svg>
			);
		}
		return <Gridicon className={ iconClass } icon={ iconTypeDescription } size={ iconSize } />;
	}

	return (
		<a
			className="help-result"
			href={ localizeUrl( helpLink.link ) }
			target="__blank"
			onClick={ handleClick }
		>
			<CompactCard className="help-result__wrapper">
				{ compact && getResultIcon() }
				<div className="help-result__content-wrapper">
					<h2 className="help-result__title">{ helpLink.title }</h2>
					{ ! compact && <p className="help-result__description">{ helpLink.description }</p> }
				</div>
				{ ! compact && (
					<div className="help-result__icon-wrapper">
						{ getResultImage() }
						{ getResultIcon() }
					</div>
				) }
			</CompactCard>
		</a>
	);
};

export default HelpResultComponent;
