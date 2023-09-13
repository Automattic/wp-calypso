import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import './styles.scss';

export default function DomainAnalyzer() {
	const translate = useTranslate();

	return (
		<div className="domain-analyzer">
			<h1>{ translate( 'Who Hosts This Site?' ) }</h1>
			<p>
				{ translate(
					'Access essential information about a site, such as hosting provider, domain details, and contact information.'
				) }
			</p>

			<form className="domain-analyzer--form">
				<div className="domain-analyzer--form-container">
					<div className="col-1">
						<input type="text" name="domain" placeholder={ translate( 'mysite.com' ) } />
					</div>
					<div className="col-2">
						<Button>{ translate( 'Check site' ) }</Button>
					</div>
				</div>
			</form>
		</div>
	);
}
