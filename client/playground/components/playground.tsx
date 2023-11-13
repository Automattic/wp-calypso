import arrowImg from 'calypso/assets/images/playground/arrow.png';
import { LayoutBlock } from '../../site-profiler/components/layout';

import './styles.scss';

export default function Playground() {
	return (
		<>
			<LayoutBlock width="medium" className="heading-block">
				<h1>Playground</h1>
				<p>
					WordPress Playground is an online platform that allows you to experiment and learn about
					WordPress without affecting your live website. It's a virtual sandbox where you can play
					around with different features, designs, and settings in a safe and controlled
					environment.
				</p>
				<ul>
					<li>Try themes and plugins on the fly</li>
					<li>Create content on the go</li>
					<li>And, yes it's safe</li>
				</ul>
				<p>
					Unlock the power of seamless transitions between creativity and reality with our platform.
				</p>
				<p>
					Everything you craft in the playground becomes a tangible asset as it can effortlessly be
					exported as a zip file and seamlessly imported onto your live site at&nbsp;
					<a href="https://wordpress.com">wordpress.com</a>. This ensures a smooth transition from
					experimentation to implementation and serves as a reliable backup, allowing you to upload
					and further refine your site with confidence in the playground.
				</p>
				<p>
					If your backup zip file is ready,{ ' ' }
					<a href="https://wordpress.com/import">import it from here</a>, and watch your vision come
					to life effortlessly.
				</p>
				<img className="arrow-pointer" src={ arrowImg } alt="Arrow" />
			</LayoutBlock>
			<div className="wp-playground-container">
				<iframe title="Playground" src="https://playground.wordpress.net"></iframe>
			</div>
		</>
	);
}
