import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

const api = axios.create({ baseURL: 'http://localhost:8080/api' });
const ASSIGNEES_BY_TYPE = {
  'Bug / Defect': 'Software Developer / QA Engineer',
  'Feature Request': 'Software Developer / Development Team',
  'Enhancement': 'Software Developer',
  'UI/UX': 'UI/UX Designer + Frontend Developer',
  'Security': 'Security Engineer / Backend Developer',
  'Performance': 'Backend Developer / DevOps Engineer',
  'Database': 'Database Developer / Backend Developer',
  'API / Integration': 'Backend Developer',
  'Testing / QA': 'QA Engineer / Tester',
  'Deployment / DevOps': 'DevOps Engineer',
  'Documentation': 'Technical Writer / Developer',
  'Project / Task Management': 'Project Manager / Scrum Master'
};
const ISSUE_TYPES = Object.keys(ASSIGNEES_BY_TYPE);
const normalizeType = type => type === 'Bug' ? 'Bug / Defect' : type === 'Task' ? 'Project / Task Management' : type;
const emptyIssue = { title: '', description: '', issueType: 'Bug / Defect', priority: 'Medium', status: 'Open', assignee: ASSIGNEES_BY_TYPE['Bug / Defect'], dueDate: '' };
const messageFor = (error, fallback) => error.response?.data?.message || error.response?.data?.detail || fallback;

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', registrationCode: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const changeMode = nextMode => {
    setMode(nextMode);
    setError('');
    setShowPassword(false);
    setForm({ name: '', email: '', password: '', registrationCode: '' });
  };
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try {
      const endpoint = mode === 'login' ? 'login' : mode === 'admin' ? 'register-admin' : 'register';
      const { data } = await api.post(`/auth/${endpoint}`, form);
      localStorage.setItem('issueTrackerUser', JSON.stringify(data));
      onAuthenticated(data);
    } catch (err) { setError(messageFor(err, 'Authentication failed.')); }
    finally { setSubmitting(false); }
  };
  const heading = mode === 'login' ? 'Welcome back' : mode === 'admin' ? 'Create admin account' : 'Create your account';
  const description = mode === 'login' ? 'Enter your details to access your workspace.' : mode === 'admin' ? 'Register an administrator to review and manage issue statuses.' : 'Start creating and tracking your software issues.';
  return <main className="auth-shell">
    <section className="auth-visual" aria-label="Issue Tracker introduction">
      <div className="auth-brand-mark">IT</div>
      <p className="eyebrow">Issue Tracker</p>
      <h2>Keep every issue visible, owned, and moving forward.</h2>
      <p>One focused workspace for reporting problems, following progress, and keeping your team aligned.</p>
      <ul className="auth-benefits"><li><span>✓</span> Track issues from Open to Closed</li><li><span>✓</span> See updates and activity in one place</li><li><span>✓</span> Role-based user and admin access</li></ul>
    </section>
    <section className="auth-card">
      <div className="auth-tabs" role="tablist" aria-label="Account type">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={()=>changeMode('login')}>Sign in</button>
        <button type="button" className={mode === 'user' ? 'active' : ''} onClick={()=>changeMode('user')}>User</button>
        <button type="button" className={mode === 'admin' ? 'active' : ''} onClick={()=>changeMode('admin')}>Admin</button>
      </div>
      <div className="auth-heading"><h2>{heading}</h2><p>{description}</p></div>
      {error && <div className="error-message" role="alert">{error}</div>}
      <form className="auth-form" onSubmit={submit}>
        {mode !== 'login' && <label>Full name<input required autoComplete="name" placeholder="Enter your full name" value={form.name} onChange={e => setForm({...form, name:e.target.value})}/></label>}
        <label>Email address<input required type="email" autoComplete="email" placeholder="name@example.com" value={form.email} onChange={e => setForm({...form, email:e.target.value})}/></label>
        <label>Password<div className="password-field"><input required minLength="6" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Minimum 6 characters" value={form.password} onChange={e => setForm({...form, password:e.target.value})}/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
        {mode === 'admin' && <label>Admin registration code<input required type="password" autoComplete="off" placeholder="Enter your secure admin code" value={form.registrationCode} onChange={e => setForm({...form, registrationCode:e.target.value})}/><small>Ask the system owner for this private code.</small></label>}
        <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : mode === 'login' ? 'Sign in to workspace' : mode === 'admin' ? 'Create admin account' : 'Create user account'}</button>
      </form>
      <p className="auth-switch">{mode === 'login' ? <>New here? <button type="button" onClick={()=>changeMode('user')}>Create a user account</button></> : <>Already have an account? <button type="button" onClick={()=>changeMode('login')}>Sign in</button></>}</p>
    </section>
  </main>;
}

function IssueForm({ initial = emptyIssue, onSave, onCancel, title, clearAfterSave = false }) {
  const initialType = normalizeType(initial.issueType);
  const [form, setForm] = useState({...initial, issueType: initialType, assignee: ASSIGNEES_BY_TYPE[initialType], status: ['Open','Closed'].includes(initial.status) ? initial.status : 'Open'});
  return <section className="panel">
    <h2>{title}</h2>
    <form className="issue-form" onSubmit={async e => {
      e.preventDefault();
      const saved = await onSave(form);
      if (saved && clearAfterSave) setForm({...emptyIssue});
    }}>
      <label>Title<input required maxLength="120" name="title" value={form.title} onChange={e => setForm({...form,title:e.target.value})}/></label>
      <label className="wide">Description<textarea required maxLength="2000" value={form.description} onChange={e => setForm({...form,description:e.target.value})}/></label>
      <label>Issue type<select value={form.issueType} onChange={e => setForm({...form,issueType:e.target.value,assignee:ASSIGNEES_BY_TYPE[e.target.value]})}>{ISSUE_TYPES.map(type=><option key={type}>{type}</option>)}</select></label>
      <label>Priority<select value={form.priority} onChange={e => setForm({...form,priority:e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
      <label>Status<select value={['Open','Closed'].includes(form.status) ? form.status : 'Open'} onChange={e => setForm({...form,status:e.target.value})}><option>Open</option><option>Closed</option></select></label>
      <label>Recommended assignee<input readOnly value={form.assignee}/><small>Automatically assigned from the selected issue type.</small></label>
      <label>Due date<input required type="date" value={form.dueDate} onChange={e => setForm({...form,dueDate:e.target.value})}/></label>
      <div className="wide"><button type="submit">Submit issue</button>{onCancel && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}</div>
    </form>
  </section>;
}

function AdminDashboard({ user, onLogout }) {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({status:'', priority:'', issueType:''});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/issues', { headers: { 'X-User-Id': user.id } })
      .then(({data}) => setIssues(data))
      .catch(err => setError(messageFor(err, 'Unable to load the admin dashboard.')))
      .finally(() => setLoading(false));
  }, [user.id]);

  const visible = useMemo(() => issues.filter(issue => {
    const query = search.toLowerCase();
    return (!query || issue.title?.toLowerCase().includes(query) || issue.description?.toLowerCase().includes(query))
      && (!filters.status || issue.status === filters.status)
      && (!filters.priority || issue.priority === filters.priority)
      && (!filters.issueType || issue.issueType === filters.issueType);
  }), [issues, search, filters]);
  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'Open').length,
    completed: issues.filter(i => ['Resolved','Closed'].includes(i.status)).length,
    closed: issues.filter(i => i.status === 'Closed').length,
    high: issues.filter(i => ['High','Critical'].includes(i.priority)).length
  };
  const updateStatus = async (issue, status) => {
    setError('');
    try {
      const {data} = await api.put(`/admin/issues/${issue.id}/status`, {status}, { headers: { 'X-User-Id': user.id } });
      setIssues(issues.map(item => item.id === data.id ? data : item));
    } catch (err) { setError(messageFor(err, 'Unable to update ticket status.')); }
  };

  return <div className="tracker">
    <div className="user-bar"><span>Administrator: <strong>{user.name}</strong></span><button className="secondary" onClick={onLogout}>Log out</button></div>
    <div className="admin-banner"><strong>Admin dashboard</strong><span>Read-only overview of issues created by all users</span></div>
    {error && <div className="error-message">{error}</div>}
    <section className="dashboard">
      <article><strong>{stats.total}</strong><span>Total issues</span></article><article><strong>{stats.open}</strong><span>Open</span></article>
      <article><strong>{stats.completed}</strong><span>Completed</span></article><article><strong>{stats.high}</strong><span>High priority</span></article>
      <article className="closed-summary"><strong>{stats.closed}</strong><span>Closed issues</span><button onClick={()=>setFilters({...filters,status:'Closed'})}>View closed</button></article>
    </section>
    <section className="panel">
      <div className="section-title"><h2>{filters.status === 'Closed' ? 'Closed user issues' : "All users' issues"}</h2><div>{filters.status === 'Closed' && <button className="secondary" onClick={()=>setFilters({...filters,status:''})}>Show all</button>}{loading && <span>Loading…</span>}</div></div>
      <div className="filters">
        <input aria-label="Search issues" placeholder="Search title or description…" value={search} onChange={e=>setSearch(e.target.value)}/>
        {[['status',['Open','In Progress','Resolved','Closed']],['priority',['Low','Medium','High','Critical']],['issueType',ISSUE_TYPES]].map(([key,values])=><select key={key} aria-label={`Filter by ${key}`} value={filters[key]} onChange={e=>setFilters({...filters,[key]:e.target.value})}><option value="">All {key === 'issueType' ? 'types' : `${key}s`}</option>{values.map(v=><option key={v}>{v}</option>)}</select>)}
      </div>
      {!loading && visible.length===0 ? <p className="empty">No matching issues.</p> : <div className="issue-list">{visible.map(issue=><article className="issue-card" key={issue.id}>
        <div className="issue-top"><div><div className="badges"><span className={`priority ${issue.priority?.toLowerCase()}`}>{issue.priority}</span><span>{issue.issueType}</span></div><h3>{issue.title}</h3><p>{issue.description}</p></div><span className={`status ${issue.status?.toLowerCase().replace(/\s+/g,'-')}`}>{issue.status}</span></div>
        <div className="issue-owner"><span className="owner-avatar">{(issue.creatorName || '?').charAt(0).toUpperCase()}</span><div><small>Raised by</small><strong>{issue.creatorName || 'Unknown user'}</strong>{issue.creatorEmail && <span>{issue.creatorEmail}</span>}</div></div>
        <div className="meta"><span>Assignee: {issue.assignee}</span><span>Due: {issue.dueDate}</span></div>
        <div className="issue-actions"><label className="inline-label">Admin status<select value={issue.status} onChange={e=>updateStatus(issue,e.target.value)}><option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option></select></label></div>
      </article>)}</div>}
    </section>
  </div>;
}

function IssueTracker() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('issueTrackerUser') || 'null'));
  const [issues, setIssues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [comment, setComment] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({status:'', priority:'', issueType:''});
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const userConfig = { headers: { 'X-User-Id': user?.id } };

  const loadIssues = useCallback(async () => {
    setLoading(true); setError('');
    try { setIssues((await api.get('/issues', { headers: { 'X-User-Id': user?.id } })).data); }
    catch (err) { setError(messageFor(err, 'Failed to load issues. Is the backend and MongoDB running?')); }
    finally { setLoading(false); }
  }, [user?.id]);
  useEffect(() => {
    if (!user || user.role === 'ADMIN') return undefined;
    loadIssues();
    const refreshTimer = window.setInterval(loadIssues, 10000);
    return () => window.clearInterval(refreshTimer);
  }, [user, loadIssues]);

  const visible = useMemo(() => issues.filter(issue => {
    const query = search.toLowerCase();
    return (!query || issue.title?.toLowerCase().includes(query) || issue.description?.toLowerCase().includes(query))
      && (!filters.status || issue.status === filters.status)
      && (!filters.priority || issue.priority === filters.priority)
      && (!filters.issueType || issue.issueType === filters.issueType);
  }), [issues, search, filters]);
  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'Open').length,
    completed: issues.filter(i => ['Resolved','Closed'].includes(i.status)).length,
    high: issues.filter(i => ['High','Critical'].includes(i.priority)).length
  };
  const adminNotifications = issues.filter(issue => issue.lastStatusUpdatedBy === 'ADMIN');
  const saveNew = async form => {
    setError('');
    try {
      await api.post('/issues', form, userConfig);
      await loadIssues();
      return true;
    } catch (err) {
      setError(messageFor(err, 'Unable to create issue.'));
      return false;
    }
  };
  const saveEdit = async form => {
    try {
      const {data} = await api.put(`/issues/${editing.id}`, form, userConfig);
      setIssues(issues.map(i => i.id === data.id ? data : i)); setSelected(data); setEditing(null);
    } catch (err) { setError(messageFor(err, 'Unable to update issue.')); }
  };
  const remove = async issue => {
    if (!window.confirm(`Delete “${issue.title}”?`)) return;
    try { await api.delete(`/issues/${issue.id}`, userConfig); setIssues(issues.filter(i => i.id !== issue.id)); if(selected?.id===issue.id)setSelected(null); }
    catch (err) { setError(messageFor(err, 'Unable to delete issue.')); }
  };
  const updateStatus = async (issue, status) => {
    try { const {data}=await api.put(`/issues/${issue.id}`, {...issue,status}, userConfig); setIssues(issues.map(i=>i.id===data.id?data:i)); if(selected?.id===data.id)setSelected(data); }
    catch (err) { setError(messageFor(err, 'Unable to update status.')); }
  };
  const addComment = async e => {
    e.preventDefault();
    try { await api.post(`/issues/${selected.id}/comments`, {author:user.name,text:comment}, userConfig); setComment(''); const {data}=await api.get(`/issues/${selected.id}`, userConfig); setSelected(data); setIssues(issues.map(i=>i.id===data.id?data:i)); }
    catch (err) { setError(messageFor(err, 'Unable to add comment.')); }
  };
  const logout = () => { localStorage.removeItem('issueTrackerUser'); setUser(null); };
  if (!user) return <Auth onAuthenticated={setUser}/>;
  if (user.role === 'ADMIN') return <AdminDashboard user={user} onLogout={logout}/>;

  return <div className="tracker">
    <div className="user-bar"><span>Signed in as <strong>{user.name}</strong></span><button className="secondary" onClick={logout}>Log out</button></div>
    {error && <div className="error-message">{error}</div>}
    {adminNotifications.length > 0 && <div className="notification-banner">
      <strong>Admin status updates</strong>
      <span>{adminNotifications.length} ticket{adminNotifications.length === 1 ? ' has' : 's have'} a status set by an administrator. View Issue History for details.</span>
    </div>}
    {!showHistory ? <>
      <section className="dashboard">
        <article><strong>{stats.total}</strong><span>Total issues</span></article><article><strong>{stats.open}</strong><span>Open</span></article>
        <article><strong>{stats.completed}</strong><span>Completed</span></article><article><strong>{stats.high}</strong><span>High priority</span></article>
      </section>
      <IssueForm title="Create issue" onSave={saveNew} clearAfterSave/>
      <div className="history-control">
        <button onClick={()=>setShowHistory(true)}>View Issue History</button>
        <span>{issues.length} issue{issues.length === 1 ? '' : 's'} created by you</span>
      </div>
    </> : <section className="panel history-page">
      <div className="history-page-header">
        <div><p className="eyebrow">Issue history</p><h2>My created issues</h2></div>
        <button className="secondary" onClick={()=>setShowHistory(false)}>← Back to Create Issue</button>
      </div>
      <p className="history-summary">Showing {visible.length} of {issues.length} issues created by you.</p>
      {loading && <p>Loading…</p>}
      <div className="filters">
        <input aria-label="Search issues" placeholder="Search title or description…" value={search} onChange={e=>setSearch(e.target.value)}/>
        {[['status',['Open','In Progress','Resolved','Closed']],['priority',['Low','Medium','High','Critical']],['issueType',ISSUE_TYPES]].map(([key,values])=><select key={key} aria-label={`Filter by ${key}`} value={filters[key]} onChange={e=>setFilters({...filters,[key]:e.target.value})}><option value="">All {key === 'issueType' ? 'types' : `${key}s`}</option>{values.map(v=><option key={v}>{v}</option>)}</select>)}
      </div>
      {!loading && visible.length===0 ? <p className="empty">No matching issues.</p> : <div className="issue-list">{visible.map(issue=><article className="issue-card" key={issue.id}>
        <div className="issue-top"><div><div className="badges"><span className={`priority ${issue.priority?.toLowerCase()}`}>{issue.priority || 'Medium'}</span><span>{issue.issueType || 'Bug'}</span></div><h3>{issue.title}</h3><p>{issue.description}</p></div><span className={`status ${issue.status?.toLowerCase().replace(/\s+/g,'-')}`}>{issue.status}</span></div>
        <div className="meta"><span>Assignee: {issue.assignee || 'Unassigned'}</span><span>Due: {issue.dueDate || 'Not set'}</span>{issue.lastStatusUpdatedBy === 'ADMIN' && <span className="admin-status-label">Admin status: {issue.status}</span>}</div>
        <div className="issue-actions"><button onClick={()=>setSelected(issue)}>View details</button><button className="secondary" onClick={()=>setEditing(issue)}>Edit</button><select aria-label="Update status" value={issue.status} onChange={e=>updateStatus(issue,e.target.value)}><option>Open</option><option>Closed</option></select><button className="danger" onClick={()=>remove(issue)}>Delete</button></div>
      </article>)}</div>}
    </section>}
    {editing && <div className="modal" role="dialog"><div className="modal-content"><IssueForm title="Edit issue" initial={editing} onSave={saveEdit} onCancel={()=>setEditing(null)}/></div></div>}
    {selected && !editing && <div className="modal" role="dialog"><div className="modal-content detail"><button className="close secondary" onClick={()=>setSelected(null)}>Close</button><h2>{selected.title}</h2><p>{selected.description}</p><div className="detail-grid"><span><b>Type</b>{selected.issueType}</span><span><b>Priority</b>{selected.priority}</span><span><b>Status</b>{selected.status}</span><span><b>Assignee</b>{selected.assignee}</span><span><b>Due date</b>{selected.dueDate}</span><span><b>Created</b>{new Date(selected.createdAt).toLocaleString()}</span></div>
      <h3>Comments</h3><form className="comment-form" onSubmit={addComment}><textarea required maxLength="1000" placeholder="Add a comment…" value={comment} onChange={e=>setComment(e.target.value)}/><button>Add comment</button></form><div className="timeline">{(selected.comments||[]).map((c,i)=><div key={i}><strong>{c.author}</strong><small>{new Date(c.createdAt).toLocaleString()}</small><p>{c.text}</p></div>)}{!selected.comments?.length&&<p>No comments yet.</p>}</div>
      <h3>Activity history</h3><div className="timeline">{(selected.activities||[]).slice().reverse().map((a,i)=><div key={i}><strong>{a.message}</strong><small>{new Date(a.createdAt).toLocaleString()}</small></div>)}</div>
    </div></div>}
  </div>;
}
export default IssueTracker;
