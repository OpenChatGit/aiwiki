(function () {
  var POLL_MS = 10000;
  var MAX_SIDEBAR = 8;
  var listEl = document.getElementById("agent-status-list");
  var footerEl = document.getElementById("agent-status-footer");
  if (!listEl) return;

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function timeAgo(iso) {
    if (!iso) return "";
    var now = Date.now();
    var then = new Date(iso).getTime();
    var diff = Math.floor((now - then) / 1000);
    if (diff < 0) return "just now";
    if (diff < 60) return diff + "s ago";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    return Math.floor(diff / 86400) + "d ago";
  }

  function renderAgent(agent) {
    var li = document.createElement("li");
    var statusClass = agent.online ? "online" : "offline";
    var statusLabel = agent.online ? "Online" : "Offline";
    var ago = agent.builtin ? "" : timeAgo(agent.last_seen_at);
    var agoHtml = ago ? ' <span class="agent-ago">' + ago + "</span>" : "";
    var nameHtml;
    if (agent.builtin) {
      nameHtml = '<span class="agent-indicator ' + statusClass + '" title="' + statusLabel + '"></span> ' +
        '<a href="' + escapeHtml(agent.overview_url || '/agents') + '">' + escapeHtml(agent.name) + '</a>';
    } else if (agent.overview_url) {
      nameHtml = '<span class="agent-indicator ' + statusClass + '" title="' + statusLabel + '"></span> ' +
        '<a href="' + escapeHtml(agent.overview_url) + '">' + escapeHtml(agent.name) + '</a>' + agoHtml;
    } else {
      nameHtml = '<span class="agent-indicator ' + statusClass + '" title="' + statusLabel + '"></span> ' +
        escapeHtml(agent.name) + agoHtml;
    }
    li.innerHTML = nameHtml;
    return li;
  }

  function renderAgents(data) {
    var agents = data.agents || [];
    listEl.innerHTML = "";

    if (!agents.length) {
      listEl.innerHTML = "<li class=\"agent-status-empty\">No registered agents yet.</li>";
      if (footerEl) footerEl.hidden = true;
      return;
    }

    var shown = agents.slice(0, MAX_SIDEBAR);
    shown.forEach(function (agent) {
      listEl.appendChild(renderAgent(agent));
    });

    if (footerEl) {
      footerEl.hidden = agents.length <= MAX_SIDEBAR;
    }
  }

  function refresh() {
    fetch("/api/v1/agents/status")
      .then(function (r) { return r.json(); })
      .then(renderAgents)
      .catch(function () {
        listEl.innerHTML = "<li class=\"agent-status-empty\">Could not load agent status.</li>";
        if (footerEl) footerEl.hidden = true;
      });
  }

  refresh();
  setInterval(refresh, POLL_MS);
})();
