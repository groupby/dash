<gb-build>
  <li class="gb-build-indicator { status }">
    <h2>{ build }</h2>
  </li>

  <script>
    const socket = opts.socket;
    socket.on(this.build, ({ status }) => this.update({ status }));
  </script>

  <style scoped>
    :scope .gb-build-indicator {
      background-color: grey;
      padding: 20px;
    }
    :scope .gb-build-indicator.running {
      background-color: lightblue;
    }
    :scope .gb-build-indicator.failed {
      background-color: red;
    }
    :scope .gb-build-indicator.success {
      background-color: lightgreen;
    }
  </style>
</gb-build>
