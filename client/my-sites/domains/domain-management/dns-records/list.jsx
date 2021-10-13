import classNames from 'classnames';

import './list.scss';

export default function DnsRecordList( { children, className } ) {
	return <ul className={ classNames( 'dns-records__list', className ) }>{ children }</ul>;
}
