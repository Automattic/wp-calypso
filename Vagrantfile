Vagrant.configure("2") do |config|
  config.vm.define "app" do |app|
    app.vm.provider "docker" do |d|
      d.build_dir = "."
      d.host_vm_build_dir_options = { rsync__args: ["--verbose", "--archive", "--delete", "-z", "--links"] }
      d.ports = ["3000:3000"]
      d.create_args = ["--env", "CALYPSO_ENV=wpcalypso"]
      d.vagrant_vagrantfile = "./Vagrantfile-boot2docker"
    end
  end
end
