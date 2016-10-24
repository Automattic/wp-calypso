Site Settings JSX
=================

Site settings are broken into several different pages; general, writing, discussion, analytics, seo, and security. The settings are dependent on the type and features of the selected site. Because much of the wiring for these components is the same, they all use the mixin `form-base` to declare common methods.

Site Security Settings
----------------------

The security section only applies to Jetpack sites. Just like on the Jetpack settings page in wp-admin, each feature can be activated and deactivated. Each feature, when active, has its settings and save button.

### Jetpack Protect

Allows a user to manage the Jetpack Protect module on their site. They can activate/deactivate the feature and manage an IP address whitelist in case they mistakenly get locked out of their site.

#### API Communications

1. We learn if the Jetpack module is active or not via the `verifyModulesActive` method on the Jetpack site component. This communicates directly with the site via a GET request to a Jetpack endpoint `/sites/:site_id:/jetpack/modules/`

2. We activate / deactivate the module by a POST request to a Jetpack endpoint `/sites/:site_id:/jetpack/modules/protect`

3. We read and write the IP address endpoint via the site settings endpoint `/sites/:site_id:/settings`

### Jetpack Scan

Allows a user to manage SSH scanning on their site. This uses VaultPress technology to scan a site for vulnerabilities and malicious files. Users are sent emails if vulnerabilities are found.

#### API Communications

1. We fetch the SSH settings via a GET request to `/sites/:site_id:/ssh-credentials/mine`

2. We activate / deactivate Jetpack Scan via a POST request to `/sites/:site_id:/ssh-credentials/mine`

3. We update SSH settings via a POST request to `/sites/:site_id:/ssh-credentials/new`

4. Email notifications are sent accordingly.

### Jetpack Monitor

Allows a user to manage the Jetpack Monitor module on their site. They can turn the feature on and off and manage whether they receive email notifications.

#### Why would someone not want to receive emails? Can't they just deactivate the module?

Great question. In some cases, multiple users will connect their WordPress.com account to their Jetpack site. For example, the agency who built the site may have a connection, and the client who owns the site will also have a connection. Perhaps the agency wants to receive downtime notifications from Monitor, while the client does not. Or vice versa.

#### API Communications

1. We learn if the Jetpack module is active or not via the `verifyModulesActive` method on the Jetpack site component. This communicates directly with the site via a GET request to a Jetpack endpoint `/sites/:site_id:/jetpack/modules/`.

2. We activate / deactivate the module by a POST request to a Jetpack endpoint `/sites/:site_id:/jetpack/modules/monitor`.

3. We toggle the email setting via a POST to `/jetpack-blogs/:site_id:`.

4. Email notifications are sent accordingly.
