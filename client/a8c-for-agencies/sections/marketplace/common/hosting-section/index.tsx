import { ReactNode } from 'react';
import './style.scss';

type Props = {
	children: ReactNode;
	heading: string;
	subheading?: string;
	icon?: ReactNode;
	description?: string;
};

export default function HostingSection( {
	icon,
	heading,
	subheading,
	description,
	children,
}: Props ) {
	return (
		<div className="hosting-section-wrapper">
			<div className="hosting-section">
				<div className="hosting-section__sub-header">
					{ icon && <div className="hosting-section__icon">{ icon }</div> }
					{ subheading && (
						<span className="hosting-section__sub-header-title">{ subheading }</span>
					) }
				</div>

				<div className="hosting-section__header">
					<h2 className="hosting-section__header-title">{ heading }</h2>

					{ description && <p className="hosting-section__header-description">{ description }</p> }
				</div>
				{ children }
			</div>
		</div>
	);
}
