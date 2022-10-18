import './style.scss';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import AutomatticLogo from 'calypso/components/automattic-logo';

const UniversalNavbarFooterAutomattic = () => {
	const translate = useTranslate();
	const automatticRoger = translate(
		'brainchild contraption creation experiment invention joint medley opus production ruckus thingamajig'
	);
	const [ roger, setRoger ] = useState( '' );
	useEffect( () => {
		setRoger( automatticRoger.split( /\s+/ )[ Math.floor( Math.random() * ( 10 - 0 + 1 ) + 0 ) ] );
	}, [ automatticRoger ] );

	return (
		<div className="lpc-footer-automattic-nav">
			<div className="lpc-footer-automattic-nav-wrapper">
				<a className="lp-logo-label" href="https://automattic.com/">
					{ translate( 'An' ) }
					<span className="lp-hidden">Automattic</span>
					<AutomatticLogo size={ 18 } className={ 'lp-icon lp-icon__custom-automattic-footer' } />
					{ roger }
				</a>
				<div className="lp-logo-label-spacer"></div>
				<a href="https://automattic.com/work-with-us/">
					<span className="lp-link-chevron-external">{ translate( 'Work With Us' ) }</span>
				</a>
			</div>
		</div>
	);
};

export default UniversalNavbarFooterAutomattic;
