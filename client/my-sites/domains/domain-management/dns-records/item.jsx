/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './item.scss';

function DnsRecordListItem( { disabled, type, name, content, action } ) {
	return (
		<li className={ classNames( 'dns-records__list-item', { 'is-disabled': disabled } ) }>
			<div className="dns-records__list-type">
				<span>{ type }</span>
			</div>
			<div className="dns-records__list-info">
				<strong>{ name }</strong>
				<em>{ content }</em>
			</div>
			{ action }
		</li>
	);
}

export default DnsRecordListItem;
