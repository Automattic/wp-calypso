import clsx from 'clsx';

import './list.scss';

export default function DnsRecordList( { children, className } ) {
	return <ul className={ clsx( 'dns-records__list', className ) }>{ children }</ul>;
}
