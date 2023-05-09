import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

function EmailStepSideBar() {
	const translate = useTranslate();
	function getExplainers() {
		const title = translate(
			'{{b}}75%{{/b}} of U.S. e-commerce customers prefer to trust a business with a custom email',
			{
				components: { b: <strong /> },
			}
		);
		const contents = (
			<>
				<p>
					<Gridicon icon="checkmark" size={ 18 } />
					{ translate( 'Stand out with every email you send' ) }
				</p>
				<p>
					<Gridicon icon="checkmark" size={ 18 } />
					{ translate( 'Single dashboard for your email, domain and website' ) }
				</p>
				<p>
					<Gridicon icon="checkmark" size={ 18 } />
					{ translate( 'Easy to import your existing emails and contacts' ) }
				</p>
			</>
		);

		return { title, contents };
	}

	const { title, contents } = getExplainers();

	return (
		<div className="email-step-side-bar">
			<div className="email-step-side-bar__title">{ title }</div>
			<div className="email-step-side-bar__contents">{ contents }</div>
		</div>
	);
}

export default EmailStepSideBar;
