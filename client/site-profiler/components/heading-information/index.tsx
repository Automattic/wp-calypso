import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import './styles.scss';

interface Props {
	domain: string;
	onCheckAnotherSite?: () => void;
}

export default function HeadingInformation( props: Props ) {
	const { domain, onCheckAnotherSite } = props;

	return (
		<div className="heading-information">
			<summary>
				<h5>Who Hosts This Site?</h5>
				<div className="domain">
					<span className="status-icon green">
						<Gridicon icon="checkmark" size={ 18 } />
					</span>
					<span className="status-icon blue">
						<Gridicon icon="checkmark" size={ 18 } />
					</span>
					<span className="status-icon red">
						<Gridicon icon="cross" size={ 18 } />
					</span>
					{ domain }
				</div>
				<p>Nice! This site and its domain are fully hosted on WordPress.com!</p>
			</summary>
			<footer>
				<p>
					If you own this site, host it with <strong>WordPress.com</strong> and benefit from one of
					the best hosting platforms in the world.
				</p>
				<div className="cta-wrapper">
					<Button className="button-action">Migrate site</Button>
					<Button className="button-action">Transfer domain</Button>
					<Button className="button-action">Transfer domain for free</Button>
					{ onCheckAnotherSite && (
						<Button variant="link" onClick={ onCheckAnotherSite }>
							Check another site
						</Button>
					) }
				</div>
			</footer>
		</div>
	);
}
