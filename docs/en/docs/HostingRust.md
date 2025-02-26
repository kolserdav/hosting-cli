# Hosting Rust

## Links

- [Rust with database Redis](./HostingRustRedis.md)  
- [Rust with database Postgres](./HostingRustPostgres.md)  
- [Rust with database Mysql](./HostingRustMysql.md)  
- [Rust with database Mariadb](./HostingRustMariadb.md)  
- [Rust with database Mongo](./HostingRustMongo.md)  
- [Rust with database Rabbitmq](./HostingRustRabbitmq.md)  


To host an application on Container Hosting `Rust`, you must complete the following three steps.

## 1. Installing the project management utility

> If your project files are in a Git repository, then installing the utility is not necessary, since you can run the project from the browser.

If you installed the [conhos](https://www.npmjs.com/package/conhos) utility earlier, then simply proceed to the next step. If not installed, then use [Instructions](./GettingStarted.md#introduction) to install.

## 2. Create a configuration file

> If your project files are in a Git repository, you can create a configuration file from your browser.

Configuration file for creating the `Rust` service in Container Hosting. More details in [Configuration File](./ConfigFile.md#example_configuration_file).

> Check the current version of the `Rust` container in the [official Rust repository](https://hub.docker.com/_/rust/tags)

```yml
name: my-rust-project
services:
  rust0:
    image: rust
    size: mili
    active: true
    pwd: examples/rust
    exclude:
      - target
    version: latest
    command: cargo build --release && ./target/release/main
    ports:
      - port: 3000
        type: proxy
    environment:
      - PORT=3000
```

### 3. Launching a project in the cloud

To upload files to the cloud and run services in containers, run the command:

```sh
conhos deploy
```

<div style="margin-top: 4rem;"></div>

Continue studying

[Hosting Rust Mongo <<<](./HostingRustMongo.md) | [>>> Hosting Rust Redis](./HostingRustRedis.md)
