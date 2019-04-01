/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';

/**
 * Style dependencies
 */
import './list.scss';

export default function DnsRecordList( { children, className } ) {
	return <ul className={ classNames( 'dns-records__list', className ) }>{ children }</ul>;
}
