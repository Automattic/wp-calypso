import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import './style.scss';

const Breadcrumbs = ( { items, buttons, className } ) => {
	const renderItemLabel = ( item ) => {
		if ( item.href ) {
			return <a href={ item.href }>{ item.label }</a>;
		}
		return item.label || item;
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
