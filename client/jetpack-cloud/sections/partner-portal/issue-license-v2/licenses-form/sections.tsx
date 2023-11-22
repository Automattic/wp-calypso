import { ReactNode } from 'react';

type Props = {
	title: string;
	description: string;
	children: ReactNode;
};

export default function LicensesFormSection( { title, description, children }: Props ) {
	return (
		<div className="licenses-form__section">
			<h2 className="licenses-form__section-title">
				<span>{ title }</span>
				<hr />
			</h2>
			<p className="licenses-form__section-description">{ description }</p>

			<div className="licenses-form__section-content">{ children }</div>
		</div>
	);
}
