import { Gridicon } from '@automattic/components';
import { Icon, chevronLeft } from '@wordpress/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import InfoPopover from 'calypso/components/info-popover';

import './style.scss';

/**
 * The required `items` property is an array of strings or objects that correspond to each item in the
 * Breadcrumb component. If an item is a string, it'll be rendered as text. If it's an object, it must
 * follow the structure:
 *
 * {
 *   label (required): string,
 *   href (optional): string,
 *   helpBubble (optional): string|JSX element,
 * }
 *
 * `label` is the text that will be rendered for that item. If `href` is present, it will render the
 * label as a link. If `helpBubble` is present, a help bubble with a popover containing the informed
 * text or element will be rendered besides that item's label.
 *
 * `mobileItem` is a required object and follows the same structure as an item of the `items` array
 * described earlier. It can also have a "showBackArrow" boolean property which, if true, will render
 * a back arrow before the item label when in mobile view.
 *
 * The `buttons` property is optional and can contain an array of Buttons that will be rendered on the
 * right end of the breadcrumbs. `mobileButtons` is also optional and contains an array of components
 * that will be shown on the right end of the breadcrumbs section in mobile view.
 */
const Breadcrumbs = ( { items, mobileItem, buttons, mobileButtons, className } ) => {
	const renderItemLabel = ( item ) => {
		if ( item.href ) {
			return (
				<a className="breadcrumbs__item-label" href={ item.href }>
					{ item.label }
				</a>
			);
		}
		return <span className="breadcrumbs__item-label">{ item.label || item }</span>;
	};

	const renderHelpBubble = ( item ) => {
		if ( ! item.helpBubble ) {
			return null;
		}
		return (
			<InfoPopover
				className="breadcrumbs__help-bubble"
				icon="help-outline"
				position={ 'right' }
				screenReaderText={ 'Learn more' }
			>
				{ item.helpBubble }
			</InfoPopover>
		);
	};

	const renderSeparator = ( index ) => {
		if ( index === items.length - 1 ) {
			return null;
		}
		/* eslint-disable wpcalypso/jsx-gridicon-size */
		return <Gridicon className="breadcrumbs__separator" icon="chevron-right" size={ 14 } />;
		/* eslint-enable wpcalypso/jsx-gridicon-size */
	};

	const renderItem = ( item, index ) => {
		const classes = classNames( 'breadcrumbs__item', {
			// We don't use the last-child selector here because there might be a help bubble after this element
			'is-last-item': index === items.length - 1,
		} );
		return (
			<React.Fragment key={ `breadcrumb${ index }` }>
				<span className={ classes }>{ renderItemLabel( item ) }</span>
				{ renderHelpBubble( item ) }
				{ renderSeparator( index ) }
			</React.Fragment>
		);
	};

	const renderBackArrow = () => {
		if ( mobileItem.showBackArrow && mobileItem.href ) {
			/* eslint-disable wpcalypso/jsx-gridicon-size */
			return (
				<a className="breadcrumbs__item" href={ mobileItem.href }>
					<Icon className="breadcrumbs__back-arrow" icon={ chevronLeft } size={ 20 } />
				</a>
			);
			/* eslint-enable wpcalypso/jsx-gridicon-size */
		}
		return null;
	};

	const renderMobileItem = () => {
		return (
			<>
				{ renderBackArrow() }
				<span className="breadcrumbs__item breadcrumbs__item--mobile">
					{ renderItemLabel( mobileItem ) }
				</span>
				{ renderHelpBubble( mobileItem ) }
			</>
		);
	};

	const renderItems = () => {
		return (
			<>
				<div className="breadcrumbs__items">
					{ items.map( ( item, i ) => renderItem( item, i ) ) }
				</div>
				<div className="breadcrumbs__items-mobile">{ renderMobileItem() }</div>
			</>
		);
	};

	const renderButtons = () => (
		<>
			{ buttons && (
				<div className="breadcrumbs__buttons">{ buttons.map( ( button ) => button ) }</div>
			) }
			{ mobileButtons && (
				<div className="breadcrumbs__buttons-mobile">
					{ mobileButtons.map( ( button ) => button ) }
				</div>
			) }
		</>
	);

	return (
		<div className={ classNames( 'breadcrumbs', className ) }>
			<div className="breadcrumbs__content">
				{ renderItems() }
				{ renderButtons() }
			</div>
			<div className="breadcrumbs__bottom-border"></div>
		</div>
	);
};

Breadcrumbs.propTypes = {
	items: PropTypes.array.isRequired,
	mobileItem: PropTypes.object.isRequired,
	buttons: PropTypes.array,
	mobileButtons: PropTypes.array,
	className: PropTypes.string,
};

export default Breadcrumbs;
