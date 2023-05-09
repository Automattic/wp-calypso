import './style.scss';

export default function WpcomUpsellPlaceholder() {
	return (
		<div className="wpcom-upsell-placeholder">
			<div className="wpcom-upsell-placeholder__figure">
				<div className="wpcom-upsell-placeholder__figure-wrapper">
					<div className="wpcom-upsell-placeholder__figure-placeholder"></div>
				</div>
				{ /* <img src={ imagePath } alt="Placeholder figure" /> */ }
			</div>
			<div className="wpcom-upsell-placeholder__body">
				<h2>
					<span>Placeholder Title Text</span>
				</h2>
				<p>
					<span>
						This is placeholder body text description. Ideally this text should display inline and
						wrap onto the next line.
					</span>
				</p>
				<div className="wpcom-upsell-placeholder__action">
					<div className="wpcom-upsell-placeholder__action-button">Button placeholder</div>
				</div>
			</div>
		</div>
	);
}
