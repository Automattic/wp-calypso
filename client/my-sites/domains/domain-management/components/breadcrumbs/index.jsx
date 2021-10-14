import { Gridicon } from '@automattic/components';
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
 * The `buttons` property is optional and can contain an array of Buttons that will be rendered on the
 * right end of the breadcrumbs section.
 */
const Breadcrumbs = ( { items, buttons, className } ) => {
	const renderItemLabel = ( item ) => {
		if ( item.href ) {
			return <a href={ item.href }>{ item.label }</a>;
		}
		return item.label || item;
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

	const renderItem = ( item, index ) => (
		<React.Fragment key={ `breadcrumb${ index }` }>
			<span>{ renderItemLabel( item ) }</span>
			{ renderHelpBubble( item ) }
			{ renderSeparator( index ) }
		</React.Fragment>
	);

	const renderItems = () => (
		<div className="breadcrumbs__items">{ items.map( ( item, i ) => renderItem( item, i ) ) }</div>
	);

	const renderButtons = () => (
		<div className="breadcrumbs__buttons">{ buttons.map( ( button ) => button ) }</div>
	);

	return (
		<div className={ classNames( 'breadcrumbs', className ) }>
			{ renderItems() }
			{ buttons && renderButtons() }
		</div>
	);
};

Breadcrumbs.propTypes = {
	items: PropTypes.array.isRequired,
	buttons: PropTypes.array,
	className: PropTypes.string,
};

export default Breadcrumbs;
