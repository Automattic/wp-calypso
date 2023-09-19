import { Button } from '@wordpress/components';
import './styles.scss';

interface Props {
	domain: string;
}

export default function HeadingInformation( props: Props ) {
	const { domain } = props;

	return (
		<div className="heading-information">
			<summary>
				<h5>Who Hosts This Site?</h5>
				<div className="domain">{ domain }</div>
				<p>Nice! This site and its domain are fully hosted on WordPress.com!</p>
			</summary>
			<footer>
				<Button className="button-action">Transfer domain</Button>
				<Button variant="link">Check another site</Button>
			</footer>
		</div>
	);
}
